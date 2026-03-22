export class ListProjectsQuery {
  constructor(
    public readonly organisationId: string,
    public readonly userId: string,
    public readonly page: number,
    public readonly limit: number
  ) {}
}
