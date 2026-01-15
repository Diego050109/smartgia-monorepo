import { IsIn, IsInt, IsOptional, Max, Min } from "class-validator";

export class GenerateRoutineDto {
  @IsOptional()
  @IsIn(["WEEKLY", "DAILY"])
  period?: "WEEKLY" | "DAILY";

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  daysPerWeek?: number;
}
