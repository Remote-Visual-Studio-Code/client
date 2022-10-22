export default abstract class Command {
    public abstract execute(...args: any[]): any;
    public abstract getQualifiedName(): string;
}
