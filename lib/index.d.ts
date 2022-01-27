export interface RaceDirectorOptions {
    server: string;
}
export declare class RaceDirector {
    private socket;
    constructor(options?: RaceDirectorOptions);
}
export default RaceDirector;
