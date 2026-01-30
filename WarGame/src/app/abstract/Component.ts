import { AbstractController } from "./AbstractController";
import { AbstractView } from "./AbstractView";

export type Component = {
    controller: AbstractController<AbstractView | undefined>;
    view?: AbstractView | undefined;
};
