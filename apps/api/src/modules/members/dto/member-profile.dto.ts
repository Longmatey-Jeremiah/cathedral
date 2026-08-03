import { MaritalStatus, Sex } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

/**
 * The membership registration form. Every field is optional — a member can be
 * added with just a name and filled in when the form comes back signed.
 *
 * "Surname" and "Other Names" live on the Member's lastName/firstName columns;
 * "Tel. No." on phone. Everything else is here.
 */
export class MemberProfileDto {
  @IsOptional()
  @IsEnum(Sex)
  sex?: Sex;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  placeOfBirth?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  placeOfResidence?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  occupation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  placeOfWork?: string;

  /** Church society or guild the member belongs to. */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  society?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  nextOfKin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  parentsName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  hometown?: string;

  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus?: MaritalStatus;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  spouseName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  spouseOccupation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  religiousDenomination?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(160, { each: true })
  childrenNames?: string[];

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  declarationDate?: Date;
}

/** Field names of the registration form, for copying dto → Prisma input. */
export const MEMBER_PROFILE_FIELDS = [
  'sex',
  'dateOfBirth',
  'placeOfBirth',
  'address',
  'placeOfResidence',
  'occupation',
  'placeOfWork',
  'society',
  'nextOfKin',
  'parentsName',
  'hometown',
  'maritalStatus',
  'spouseName',
  'spouseOccupation',
  'religiousDenomination',
  'childrenNames',
  'declarationDate',
] as const satisfies readonly (keyof MemberProfileDto)[];

/** Only the profile fields the caller actually sent — omitted stays untouched. */
export function memberProfileData(
  dto: MemberProfileDto,
): Partial<MemberProfileDto> {
  const data: Partial<MemberProfileDto> = {};
  for (const field of MEMBER_PROFILE_FIELDS) {
    if (dto[field] !== undefined) {
      Object.assign(data, { [field]: dto[field] });
    }
  }
  return data;
}
