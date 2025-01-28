import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { Prisma } from '@prisma/client';
import { JwtGuard } from '@/auth/guards/jwt.guard';

@Controller('transaction')
@UseGuards(JwtGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async create(@Body() createTransactionDto: Prisma.TransactionCreateInput) {
    return this.transactionService.create(createTransactionDto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.transactionService.findOne(id);
  }

  @Get('category/:category')
  async findByCategory(
    @Param('category') category: string,
    @Body('userId', ParseIntPipe) userId: number,
  ) {
    return this.transactionService.findByCategory(category, userId);
  }

  @Get('frequency/:frequency')
  async findByFrequency(@Param('frequency') frequency: string) {}

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTransactionDto: Prisma.TransactionUpdateInput,
  ) {
    return this.transactionService.update(id, updateTransactionDto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.transactionService.delete(id);
  }
}
