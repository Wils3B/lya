export class GetProjectBySlugQuery {
  constructor(
    public readonly organisationId: string,
    public readonly slug: string
  ) {}
}
