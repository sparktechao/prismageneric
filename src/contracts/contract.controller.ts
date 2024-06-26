import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Post,
  UsePipes,
  ValidationPipe,
  Get,
  Param,
  Put,
  Delete,
  NotFoundException,
} from '@nestjs/common';

import { Contract } from './entities/contract.interface';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContractsService } from './contract.service';
import { ContractStatus } from '@prisma/client';
import { PdfService } from 'src/common/services/pdf.service';

@Controller('contracts')
export class ContractsController {
  private readonly logger = new Logger(ContractsController.name);

  constructor(
    private readonly contractsService: ContractsService,
    private readonly pdfService: PdfService,
  ) {}

  @ApiOperation({ summary: 'Create a new contract with initial value' })
  @ApiResponse({ status: 201, description: 'The created contract.' })
  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Body() body: any): Promise<Contract> {
    const createDto = body as CreateContractDto;

    try {
      return await this.contractsService.createWithInitialValue(createDto);
    } catch (error) {
      console.error('Error creating contract:', error);
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  async findAll(): Promise<Contract[]> {
    try {
      return await this.contractsService.findAllContractsWithLatestValue();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Contract | null> {
    try {
      return await this.contractsService.findContractWithLatestValue(id);
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateContractDto,
  ): Promise<Contract> {
    try {
      return await this.contractsService.update({
        where: { id },
        data: updateDto,
      });
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  @Put(':id/status')
  @UsePipes(new ValidationPipe())
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ContractStatus,
  ): Promise<Contract> {
    try {
      return await this.contractsService.updateContractStatus(id, status);
    } catch (error) {
      console.error('Error updating contract status:', error);
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<Contract> {
    try {
      return await this.contractsService.delete({ where: { id } });
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }
}
