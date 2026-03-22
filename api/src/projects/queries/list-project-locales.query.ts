export class ListProjectLocalesQuery {
  constructor(
    public readonly projectId: string,
    public readonly page: number,
    public readonly limit: number
  ) {}
}
