import { Book } from '@/api/book/entities/book.entity';
import { Ingredient } from '@/api/ingredient/entities/ingredient.entity';
import { IngredientService } from '@/api/ingredient/ingredient.service';
import { RecipeIngredient } from '@/api/recipe-ingredient/entities/recipe-ingredient.entity';
import { Step } from '@/api/step/entities/step.entity';
import { User } from '@/api/user/user.entity';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { Recipe } from './entities/recipe.entity';

@Injectable()
export class RecipeService {
  @InjectRepository(Recipe)
  private readonly repository: Repository<Recipe>;

  @InjectRepository(Book)
  private readonly bookRepository: Repository<Book>;

  @InjectRepository(RecipeIngredient)
  private readonly recipeIngredientRepository: Repository<RecipeIngredient>;

  @InjectRepository(Step)
  private readonly stepRepository: Repository<Step>;

  constructor(
    private dataSource: DataSource,
    private ingredientService: IngredientService,
  ) {}

  async create(createRecipeDto: CreateRecipeDto, user: User) {
    console.log(
      'Creating recipe with DTO:',
      JSON.stringify(createRecipeDto, null, 2),
    );
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const recipe = new Recipe();
      recipe.title = createRecipeDto.title;
      recipe.description = createRecipeDto.description;
      recipe.isPublic = createRecipeDto.isPublic ?? false;
      recipe.user = user;
      recipe.user_id = user.id;

      // Associer les livres si spécifiés
      if (createRecipeDto.bookIds && createRecipeDto.bookIds.length > 0) {
        const books = await transactionalEntityManager.find(Book, {
          where: {
            id: In(createRecipeDto.bookIds),
            user_id: user.id,
          },
        });
        recipe.books = books;
      }

      // Sauvegarder la recette d'abord pour obtenir un ID
      const savedRecipe = await transactionalEntityManager.save(recipe);

      // Gérer les ingrédients
      if (
        createRecipeDto.ingredients &&
        createRecipeDto.ingredients.length > 0
      ) {
        const recipeIngredients: RecipeIngredient[] = [];

        for (const ingredientDto of createRecipeDto.ingredients) {
          let ingredient: Ingredient;

          // Si on reçoit un nom d'ingrédient mais pas d'ID, on essaie de le créer
          if (!ingredientDto.ingredient_id && ingredientDto.name) {
            ingredient = await this.ingredientService.findOrCreate(
              ingredientDto.name,
            );
          } else {
            // Sinon on utilise l'ID pour retrouver l'ingrédient existant
            ingredient = await this.ingredientService.findOne(
              ingredientDto.ingredient_id,
            );
          }

          const recipeIngredient = new RecipeIngredient();
          recipeIngredient.recipe = savedRecipe;
          recipeIngredient.recipe_id = savedRecipe.id;
          recipeIngredient.ingredient = ingredient;
          recipeIngredient.ingredient_id = ingredient.id;
          recipeIngredient.quantity = ingredientDto.quantity;
          recipeIngredient.unit = ingredientDto.unit;
          recipeIngredient.order = ingredientDto.order;

          recipeIngredients.push(recipeIngredient);
        }

        savedRecipe.recipeIngredients = await transactionalEntityManager.save(
          RecipeIngredient,
          recipeIngredients,
        );
      }

      // Gérer les étapes
      if (createRecipeDto.steps && createRecipeDto.steps.length > 0) {
        const steps: Step[] = [];

        for (const stepDto of createRecipeDto.steps) {
          const step = new Step();
          step.recipe = savedRecipe;
          step.recipe_id = savedRecipe.id;
          step.content = stepDto.content;
          step.order = stepDto.order;

          steps.push(step);
        }

        savedRecipe.steps = await transactionalEntityManager.save(Step, steps);
      }

      return savedRecipe;
    });
  }

  findAll(user: User) {
    return this.repository.find({
      where: { user_id: user.id },
      relations: [
        'user',
        'books',
        'recipeIngredients',
        'recipeIngredients.ingredient',
        'steps',
      ],
    });
  }

  findPublic() {
    return this.repository.find({
      where: {
        isPublic: true,
      },
      relations: [
        'user',
        'books',
        'recipeIngredients',
        'recipeIngredients.ingredient',
        'steps',
      ],
    });
  }

  async findOne(id: number, user: User) {
    const recipe = await this.repository.findOne({
      where: { id, user_id: user.id },
      relations: [
        'user',
        'books',
        'recipeIngredients',
        'recipeIngredients.ingredient',
        'steps',
      ],
    });

    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${id} not found`);
    }

    return recipe;
  }

  async findOnePublic(id: number) {
    const recipe = await this.repository.findOne({
      where: { id, isPublic: true },
      relations: [
        'user',
        'books',
        'recipeIngredients',
        'recipeIngredients.ingredient',
        'steps',
      ],
    });

    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${id} not found`);
    }

    return recipe;
  }

  async update(id: number, updateRecipeDto: UpdateRecipeDto, user: User) {
    console.log(
      'Updating recipe with DTO:',
      JSON.stringify(updateRecipeDto, null, 2),
    );

    return this.dataSource.transaction(async (transactionalEntityManager) => {
      // Vérifier que la recette existe et appartient à l'utilisateur
      const existingRecipe = await this.findOne(id, user);

      if (existingRecipe.user_id !== user.id) {
        throw new UnauthorizedException('You can only update your own recipes');
      }

      // Mettre à jour les champs de base
      if (updateRecipeDto.title) {
        existingRecipe.title = updateRecipeDto.title;
      }

      if (updateRecipeDto.description) {
        existingRecipe.description = updateRecipeDto.description;
      }

      if (updateRecipeDto.isPublic !== undefined) {
        existingRecipe.isPublic = updateRecipeDto.isPublic;
      }

      // Forcer la mise à jour du champ updatedAt
      existingRecipe.updatedAt = new Date();

      // Mettre à jour les livres associés
      if (updateRecipeDto.bookIds) {
        const books = await transactionalEntityManager.find(Book, {
          where: {
            id: In(updateRecipeDto.bookIds),
            user_id: user.id,
          },
        });
        existingRecipe.books = books;
      }

      // Sauvegarder les modifications de base
      const updatedRecipe =
        await transactionalEntityManager.save(existingRecipe);

      // Gérer les ingrédients
      if (updateRecipeDto.ingredients) {
        // Supprimer tous les ingrédients existants pour cette recette
        await transactionalEntityManager.delete(RecipeIngredient, {
          recipe_id: id,
        });

        if (updateRecipeDto.ingredients.length > 0) {
          const recipeIngredients: RecipeIngredient[] = [];

          for (const ingredientDto of updateRecipeDto.ingredients) {
            let ingredient: Ingredient;

            // Si on reçoit un nom d'ingrédient mais pas d'ID, on essaie de le créer
            if (!ingredientDto.ingredient_id && ingredientDto.name) {
              ingredient = await this.ingredientService.findOrCreate(
                ingredientDto.name,
              );
            } else {
              // Sinon on utilise l'ID pour retrouver l'ingrédient existant
              ingredient = await this.ingredientService.findOne(
                ingredientDto.ingredient_id,
              );
            }

            const recipeIngredient = new RecipeIngredient();
            recipeIngredient.recipe = updatedRecipe;
            recipeIngredient.recipe_id = updatedRecipe.id;
            recipeIngredient.ingredient = ingredient;
            recipeIngredient.ingredient_id = ingredient.id;
            recipeIngredient.quantity = ingredientDto.quantity;
            recipeIngredient.unit = ingredientDto.unit;
            recipeIngredient.order = ingredientDto.order;

            // Si l'ingrédient avait déjà un ID, le conserver
            if (ingredientDto.id) {
              recipeIngredient.id = ingredientDto.id;
            }

            recipeIngredients.push(recipeIngredient);
          }

          updatedRecipe.recipeIngredients =
            await transactionalEntityManager.save(
              RecipeIngredient,
              recipeIngredients,
            );
        }
      }

      // Gérer les étapes
      if (updateRecipeDto.steps) {
        // Supprimer toutes les étapes existantes pour cette recette
        await transactionalEntityManager.delete(Step, { recipe_id: id });

        if (updateRecipeDto.steps.length > 0) {
          const steps: Step[] = [];

          for (const stepDto of updateRecipeDto.steps) {
            const step = new Step();
            step.recipe = updatedRecipe;
            step.recipe_id = updatedRecipe.id;
            step.content = stepDto.content;
            step.order = stepDto.order;

            // Si l'étape avait déjà un ID, le conserver
            if (stepDto.id) {
              step.id = stepDto.id;
            }

            steps.push(step);
          }

          updatedRecipe.steps = await transactionalEntityManager.save(
            Step,
            steps,
          );
        }
      }

      // Récupérer la recette complète après mise à jour
      return this.repository.findOne({
        where: { id: updatedRecipe.id },
        relations: [
          'user',
          'books',
          'recipeIngredients',
          'recipeIngredients.ingredient',
          'steps',
        ],
      });
    });
  }

  async remove(id: number, user: User) {
    const recipe = await this.findOne(id, user);

    if (recipe.user_id !== user.id) {
      throw new UnauthorizedException('You can only delete your own recipes');
    }

    await this.repository.remove(recipe);
    return { success: true, message: `Recipe with ID ${id} has been deleted` };
  }
}
