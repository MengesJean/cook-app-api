import { User } from '@/api/user/user.entity';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { Recipe } from './entities/recipe.entity';

@Injectable()
export class RecipeService {
  @InjectRepository(Recipe)
  private readonly repository: Repository<Recipe>;

  async create(createRecipeDto: CreateRecipeDto, user: User) {
    const recipe = new Recipe();
    recipe.title = createRecipeDto.title;
    recipe.description = createRecipeDto.description;
    recipe.isPublic = createRecipeDto.isPublic ?? false;
    recipe.user = user;
    recipe.user_id = user.id;

    return this.repository.save(recipe);
  }

  findAll(user: User) {
    return this.repository.find({
      where: { user_id: user.id },
      relations: ['user'],
    });
  }

  findPublic() {
    return this.repository.find({
      where: {
        isPublic: true,
      },
    });
  }

  async findOne(id: number, user: User) {
    const recipe = await this.repository.findOne({
      where: { id, user_id: user.id },
      relations: ['user'],
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
