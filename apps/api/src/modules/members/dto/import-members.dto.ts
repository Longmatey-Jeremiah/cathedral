import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { CreateMemberDto } from './create-member.dto';

/** One spreadsheet's worth of members. Rows are validated individually. */
export class ImportMembersDto {
  @IsArray()
  @ArrayNotEmpty()
  // A cap keeps one request from tying up the DB; split larger files client-side.
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => CreateMemberDto)
  members!: CreateMemberDto[];
}

export class ImportMembersResultDto {
  imported!: number;
}
