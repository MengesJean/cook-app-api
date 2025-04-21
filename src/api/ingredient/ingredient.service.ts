import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { Ingredient } from './entities/ingredient.entity';

@Injectable()
export class IngredientService {
  @InjectRepository(Ingredient)
  private readonly repository: Repository<Ingredient>;

  async create(createIngredientDto: CreateIngredientDto) {
    const ingredient = new Ingredient();
    ingredient.name = createIngredientDto.name;

    return this.repository.save(ingredient);
  }

  findAll() {
    return this.repository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number) {
    const ingredient = await this.repository.findOne({ where: { id } });

    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID ${id} not found`);
    }

    return ingredient;
  }

  async update(id: number, updateIngredientDto: UpdateIngredientDto) {
    const ingredient = await this.findOne(id);

    if (updateIngredientDto.name) {
      ingredient.name = updateIngredientDto.name;
    }

    return this.repository.save(ingredient);
  }

  async remove(id: number) {
    const ingredient = await this.findOne(id);
    await this.repository.remove(ingredient);
    return {
      success: true,
      message: `Ingredient with ID ${id} has been deleted`,
    };
  }

  async findOrCreate(name: string): Promise<Ingredient> {
    let ingredient = await this.repository.findOne({ where: { name } });

    if (!ingredient) {
      ingredient = new Ingredient();
      ingredient.name = name;
      await this.repository.save(ingredient);
    }

    return ingredient;
  }
}
