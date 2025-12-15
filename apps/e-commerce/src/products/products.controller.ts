import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  ParseBoolPipe,
  Patch,
  Post,
  Query,
  UseFilters,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RpcExceptionFilter } from '../common/filters/rpc-exception.filter';
import { ProductsService } from './products.service';
import {
  ApiCommonResponses,
  BulkVariantCreateResponseDto,
  CreateProductDto,
  CreateProductVariantDto,
  ProductResponseDto,
  ProductSearchResultDto,
  SearchProductDto,
  updateProductDto,
} from 'contracts';

@ApiTags('products')
@UseFilters(new RpcExceptionFilter())
@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Post('search')
  @ApiOperation({ summary: 'Advanced product search and filtering' })
  @ApiOkResponse({
    type: ProductSearchResultDto,
    description: 'Filtered product list and pagination information rotates.',
  })
  @ApiCommonResponses()
  search(@Body() dto: SearchProductDto) {
    return this.productService.search(dto);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Find products with Slug' })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiCommonResponses()
  findBySlug(@Param('slug') slug: string) {
    return this.productService.findBySlug(slug);
  }

  @Get(':id/active')
  @ApiOperation({ summary: 'Brings the active variants of the product' })
  @ApiOkResponse({
    type: ProductResponseDto,
    description:
      'Only the product details containing active variants are displayed..',
  })
  @ApiCommonResponses()
  findActive(@Param('id') id: string) {
    return this.productService.findActive(+id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieves a single product by ID' })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiCommonResponses()
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Creates a new product' })
  @ApiCreatedResponse({
    type: ProductResponseDto,
    description: 'The product was successfully created..',
  })
  @ApiCommonResponses()
  create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Updates the product' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({
    type: ProductResponseDto,
    description: 'Updated product data returns.',
  })
  @ApiCommonResponses()
  update(@Param('id') id: string, @Body() updateProductDto: updateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete products or variants' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiQuery({
    name: 'allDel',
    required: false,
    type: Boolean,
    description: 'If true, it completely deletes the product (Soft Delete)',
  })
  @ApiQuery({
    name: 'variantIds',
    required: false,
    type: [Number],
    description: 'ID list to delete only specific variants (e.g., 1,2,3)',
  })
  @ApiOkResponse({
    type: Boolean,
    description: 'If the operation is successful, it returns true..',
  })
  @ApiCommonResponses()
  remove(
    @Param('id') id: string,
    @Query('allDel', new DefaultValuePipe(false), ParseBoolPipe)
    allDel: boolean,
    @Query(
      'variantIds',
      new ParseArrayPipe({ items: Number, separator: ',', optional: true }),
    )
    variantIds?: number[],
  ) {
    return this.productService.remove(+id, allDel, variantIds);
  }

  @Post(':id/variants')
  @ApiOperation({ summary: 'Add a new variant to the product' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiBody({ type: [CreateProductVariantDto] })
  @ApiCreatedResponse({
    type: BulkVariantCreateResponseDto,
    description: 'The list of created variants rotates.',
  })
  @ApiCommonResponses()
  createVariants(
    @Param('id') id: string,
    @Body() dto: CreateProductVariantDto[],
  ) {
    return this.productService.createVariants(+id, dto);
  }
}
