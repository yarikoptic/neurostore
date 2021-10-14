/**
 * file that handles navbar models and enums
 */

export interface NavOptionsModel {
    label: string;
    path: string;
}

export interface NavbarArgs {
    navOptions: NavOptionsModel[];
    login: () => void;
    logout: () => void;
}