import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { CreatePostDto, UpdatePostDto } from './dto/create-post.dto'
import { PostService } from './post.service'

@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @ApiOperation({ summary: 'Create a new post' })
  @Post()
  create(@Body() createPostDto: CreatePostDto) {
    return this.postService.create(createPostDto)
  }

  @ApiOperation({ summary: 'Get all posts' })
  @Get()
  findAll() {
    return this.postService.findAll()
  }

  @ApiOperation({ summary: 'Get a post by id' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const post = await this.postService.findOne(id)
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`)
    }
    return post
  }

  @ApiOperation({ summary: 'Update a post' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    const post = await this.postService.update(id, updatePostDto)
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`)
    }
    return post
  }

  @ApiOperation({ summary: 'Delete a post' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const post = await this.postService.remove(id)
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`)
    }
    return post
  }
}
