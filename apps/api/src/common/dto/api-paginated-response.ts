import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

/** Envelope shape shared by every paginated list endpoint. `data` is replaced
 *  per-endpoint by ApiPaginatedResponse below. */
export class PaginatedDto {
  total!: number;
  page!: number;
  pageSize!: number;
}

/** @ApiOkResponse for a `Paginated<Model>` — swaps `data` for an array of the
 *  given model. Swagger can't express the generic directly, hence the allOf. */
export const ApiPaginatedResponse = <T extends Type<unknown>>(model: T) =>
  applyDecorators(
    ApiExtraModels(PaginatedDto, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedDto) },
          {
            properties: {
              data: { type: 'array', items: { $ref: getSchemaPath(model) } },
            },
          },
        ],
      },
    }),
  );
