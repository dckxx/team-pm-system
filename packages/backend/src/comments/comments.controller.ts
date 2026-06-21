import { Controller, Get, Post, Param, Body, Req } from '@nestjs/common';
import { Request } from 'express';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('api')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('requirements/:requirementId/comments')
  async findByRequirement(@Param('requirementId') requirementId: string) {
    const comments = await this.commentsService.findByRequirement(requirementId);
    return { data: comments };
  }

  @Post('requirements/:requirementId/comments')
  async create(
    @Param('requirementId') requirementId: string,
    @Body() dto: CreateCommentDto,
    @Req() req: Request,
  ) {
    const user = req.user as { id: string };
    const comment = await this.commentsService.create(requirementId, dto.content, user.id);
    return { data: comment };
  }
}
