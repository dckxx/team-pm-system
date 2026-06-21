import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private readonly prismaService: PrismaService) {}

  private readonly commentSelect = {
    id: true,
    requirementId: true,
    authorId: true,
    content: true,
    mentions: true,
    createdAt: true,
    author: {
      select: {
        id: true,
        name: true,
        avatarUrl: true,
      },
    },
  };

  async findByRequirement(requirementId: string) {
    const requirement = await this.prismaService.requirement.findUnique({
      where: { id: requirementId },
    });
    if (!requirement) {
      throw new NotFoundException(`Requirement with id ${requirementId} not found`);
    }

    const comments = await this.prismaService.comment.findMany({
      where: { requirementId },
      select: this.commentSelect,
      orderBy: { createdAt: 'asc' },
    });

    return comments.map((c) => ({
      ...c,
      mentions: JSON.parse(c.mentions),
    }));
  }

  async create(requirementId: string, content: string, authorId: string) {
    const requirement = await this.prismaService.requirement.findUnique({
      where: { id: requirementId },
    });
    if (!requirement) {
      throw new NotFoundException(`Requirement with id ${requirementId} not found`);
    }

    const mentions = await this.parseMentions(content);

    const comment = await this.prismaService.comment.create({
      data: {
        requirementId,
        authorId,
        content,
        mentions: JSON.stringify(mentions),
      },
      select: this.commentSelect,
    });

    return {
      ...comment,
      mentions: JSON.parse(comment.mentions),
    };
  }

  private async parseMentions(content: string): Promise<Array<{ userId: string; name: string }>> {
    const mentionRegex = /@([^\s]+)/g;
    const matches = content.match(mentionRegex);
    if (!matches) return [];

    const names = [...new Set(matches.map((m) => m.slice(1)))];

    const mentions: Array<{ userId: string; name: string }> = [];
    for (const name of names) {
      const user = await this.prismaService.user.findFirst({
        where: { name },
        select: { id: true, name: true },
      });
      if (user) {
        mentions.push({ userId: user.id, name: user.name });
      }
    }

    return mentions;
  }
}
