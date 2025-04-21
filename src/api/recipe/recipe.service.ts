import { Book } from '@/api/book/entities/book.entity';
import { User } from '@/api/user/user.entity';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { Recipe } from './entities/recipe.entity';

@Injectable()
export class RecipeService {
  @InjectRepository(Recipe)
  private readonly repository: Repository<Recipe>;

  @InjectRepository(Book)
  private readonly bookRepository: Repository<Book>;

  async create(createRecipeDto: CreateRecipeDto, user: User) {
    const recipe = new Recipe();
    recipe.title = createRecipeDto.title;
    recipe.description = createRecipeDto.description;
    recipe.isPublic = createRecipeDto.isPublic ?? false;
    recipe.user = user;
    recipe.user_id = user.id;

    if (createRecipeDto.bookIds && createRecipeDto.bookIds.length > 0) {
      const books = await this.bookRepository.find({
        where: {
          id: In(createRecipeDto.bookIds),
        },
      });
      recipe.books = books;
    }

    return this.repository.save(recipe);
  }

  findAll(user: User) {
    return this.repository.find({
      where: { user_id: user.id },
      relations: ['user', 'books'],
    });
  }

  findPublic() {
    return this.repository.find({
      where: {
        isPublic: true,
      },
      relations: ['user', 'books'],
    });
  }

  async findOne(id: number, user: User) {
    const recipe = await this.repository.findOne({
      where: { id, user_id: user.id },
      relations: ['user', 'books'],
    });

    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${id} not found`);
    }

    return recipe;
  }

  async findOnePublic(id: number) {
    const recipe = await this.repository.findOne({
      where: { id, isPublic: true },
      relations: ['user', 'books'],
    });

    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${id} not found`);
    }

    return recipe;
  }

  async update(id: number, updateRecipeDto: UpdateRecipeDto, user: User) {
    const recipe = await this.findOne(id, user);

    if (recipe.user_id !== user.id) {
      throw new UnauthorizedException('You can only update your own recipes');
    }

    if (updateRecipeDto.title) {
      recipe.title = updateRecipeDto.title;
    }

    if (updateRecipeDto.description) {
      recipe.description = updateRecipeDto.description;
    }

    if (updateRecipeDto.isPublic !== undefined) {
      recipe.isPublic = updateRecipeDto.isPublic;
    }

    if (updateRecipeDto.bookIds) {
      const books = await this.bookRepository.findByIds(
        updateRecipeDto.bookIds,
      );
      recipe.books = books;
    }

    return this.repository.save(recipe);
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
