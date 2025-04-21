import { Recipe } from '@/api/recipe/entities/recipe.entity';
import { User } from '@/api/user/user.entity';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity';

@Injectable()
export class BookService {
  @InjectRepository(Book)
  private readonly repository: Repository<Book>;

  @InjectRepository(Recipe)
  private readonly recipeRepository: Repository<Recipe>;

  constructor(private dataSource: DataSource) {}

  async create(createBookDto: CreateBookDto, user: User) {
    const book = new Book();
    book.title = createBookDto.title;
    book.description = createBookDto.description;
    book.user = user;
    book.user_id = user.id;

    return this.repository.save(book);
  }

  async findAll(
    user: User,
    paginationDto: PaginationDto = { page: 1, limit: 10 },
  ) {
    const [items, total] = await this.repository.findAndCount({
      where: { user_id: user.id },
      relations: ['user', 'recipes'],
      skip: (paginationDto.page - 1) * paginationDto.limit,
      take: paginationDto.limit,
      order: { updatedAt: 'DESC' },
    });

    return {
      items,
      total,
      page: paginationDto.page,
      limit: paginationDto.limit,
      pages: Math.ceil(total / paginationDto.limit),
    };
  }

  async findPublic(paginationDto: PaginationDto = { page: 1, limit: 10 }) {
    const [items, total] = await this.repository.findAndCount({
      relations: ['user', 'recipes'],
      skip: (paginationDto.page - 1) * paginationDto.limit,
      take: paginationDto.limit,
      order: { updatedAt: 'DESC' },
    });

    return {
      items,
      total,
      page: paginationDto.page,
      limit: paginationDto.limit,
      pages: Math.ceil(total / paginationDto.limit),
    };
  }

  async findOne(id: number, user: User) {
    const book = await this.repository.findOne({
      where: { id, user_id: user.id },
      relations: ['user', 'recipes'],
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto, user: User) {
    const book = await this.findOne(id, user);

    if (book.user_id !== user.id) {
      throw new UnauthorizedException('You can only update your own books');
    }

    if (updateBookDto.title) {
      book.title = updateBookDto.title;
    }

    if (updateBookDto.description !== undefined) {
      book.description = updateBookDto.description;
    }

    return this.repository.save(book);
  }

  async remove(id: number, user: User) {
    const book = await this.findOne(id, user);

    if (book.user_id !== user.id) {
      throw new UnauthorizedException('You can only delete your own books');
    }

    await this.repository.remove(book);
    return { success: true, message: `Book with ID ${id} has been deleted` };
  }

  async addRecipe(bookId: number, recipeId: number, user: User) {
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const book = await transactionalEntityManager.findOne(Book, {
        where: { id: bookId, user_id: user.id },
        relations: ['recipes'],
      });

      if (!book) {
        throw new NotFoundException(`Book with ID ${bookId} not found`);
      }

      if (book.user_id !== user.id) {
        throw new UnauthorizedException('You can only modify your own books');
      }

      const recipe = await transactionalEntityManager.findOne(Recipe, {
        where: { id: recipeId, user_id: user.id },
      });

      if (!recipe) {
        throw new NotFoundException(`Recipe with ID ${recipeId} not found`);
      }

      if (!book.recipes) {
        book.recipes = [];
      }

      if (!book.recipes.some((r) => r.id === recipe.id)) {
        book.recipes.push(recipe);
      }

      return transactionalEntityManager.save(book);
    });
  }

  async removeRecipe(bookId: number, recipeId: number, user: User) {
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const book = await transactionalEntityManager.findOne(Book, {
        where: { id: bookId, user_id: user.id },
        relations: ['recipes'],
      });

      if (!book) {
        throw new NotFoundException(`Book with ID ${bookId} not found`);
      }

      if (book.user_id !== user.id) {
        throw new UnauthorizedException('You can only modify your own books');
      }

      if (!book.recipes) {
        book.recipes = [];
      }

      book.recipes = book.recipes.filter((r) => r.id !== recipeId);

      return transactionalEntityManager.save(book);
    });
  }
}
