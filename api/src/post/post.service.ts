import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ObjectId } from 'mongodb'
import { FindOneOptions, Repository } from 'typeorm'
import { CreatePostDto, UpdatePostDto } from './dto/create-post.dto'
import { Post } from './entities/post.entity'

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>
  ) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const post = this.postRepository.create(createPostDto)
    return this.postRepository.save(post)
  }

  async findAll(): Promise<Post[]> {
    return this.postRepository.find()
  }

  async findOne(id: string): Promise<Post | null> {
    const options = this.getWhereCondition(id)
    return this.postRepository.findOne(options)
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post | null> {
    const existing = await this.findOne(id)
    if (!existing) {
      return null
    }
    this.postRepository.merge(existing, updatePostDto)
    return this.postRepository.save(existing)
  }

  async remove(id: string) {
    const existing = await this.findOne(id)
    if (existing) {
      return this.postRepository.remove(existing)
    } else {
      return null
    }
  }

  /**
   * Helper to construct where condition based on DB type for findOne operations.
   * Handles string -> ObjectId conversion for Mongo, and string -> number for SQL.
   */

  private getWhereCondition(id: string): FindOneOptions<Post> {
    const dbType = process.env.LYA_DB_TYPE || 'sqlite'

    if (dbType === 'mongodb') {
      try {
        // Maps to the property decorated with @ObjectIdColumn
        return { where: { id: new ObjectId(id) } }
      } catch {
        return { where: { id: null } }
      }
    }

    const parsedId = parseInt(id, 10)
    // For SQL, maps to the property decorated with @PrimaryGeneratedColumn
    return { where: { id: isNaN(parsedId) ? null : parsedId } }
  }
}
