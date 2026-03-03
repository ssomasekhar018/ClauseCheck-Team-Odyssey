/// <reference types="vite/client" />

// Allow dotlottie-player custom element in JSX
declare namespace JSX {
    interface IntrinsicElements {
        'dotlottie-player': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
            src?: string;
            background?: string;
            autoplay?: boolean | string;
            loop?: boolean | string;
            controls?: boolean | string;
        };
    }
}
