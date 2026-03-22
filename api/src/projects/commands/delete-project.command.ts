export class DeleteProjectCommand {
  constructor(
    public readonly projectId: string,
    public readonly organisationId: string
  ) {}
}
