export class WindowsManager {

    constructor() {
        WindowsManager.standardizedDPI();
    }

    public static standardizedDPI(): void {
        const originalDPR = window.devicePixelRatio;
        Object.defineProperty(window, 'devicePixelRatio', {
            get: () => 1,
            configurable: true
        });
        const originalCreateElement = document.createElement.bind(document);
        document.createElement = function (tagName: string, options?: any): HTMLElement {
            const element = originalCreateElement(tagName, options);
            if (tagName.toLowerCase() === 'canvas') {
                const fixCanvasSize = () => {
                    if (element.parentElement) {
                        const rect = element.getBoundingClientRect();
                        if (rect.width > 0 && rect.height > 0) {
                            const canvas = element as HTMLCanvasElement;
                            if (canvas.width !== rect.width || canvas.height !== rect.height) {
                                canvas.width = rect.width;
                                canvas.height = rect.height;
                            }
                        }
                    }
                };
                setTimeout(fixCanvasSize, 0);
                const observer = new ResizeObserver(() => {
                    fixCanvasSize();
                });
                setTimeout(() => {
                    if (element.parentElement) {
                        observer.observe(element);
                    }
                }, 100);
                element.addEventListener('DOMNodeRemoved', () => {
                    observer.disconnect();
                });
            }
            return element;
        };
        const fixExistingCanvases = () => {
            document.querySelectorAll('canvas').forEach(canvas => {
                const rect = canvas.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    const htmlCanvas = canvas as HTMLCanvasElement;
                    if (htmlCanvas.width !== rect.width || htmlCanvas.height !== rect.height) {
                        htmlCanvas.width = rect.width;
                        htmlCanvas.height = rect.height;
                    }
                }
            });
        };
        setTimeout(fixExistingCanvases, 0);
        setTimeout(fixExistingCanvases, 100);
        setTimeout(fixExistingCanvases, 300);
        const observer = new MutationObserver((mutations) => {
            let hasNewCanvas = false;
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeName === 'CANVAS') {
                        hasNewCanvas = true;
                    }
                });
            });
            if (hasNewCanvas) {
                setTimeout(fixExistingCanvases, 50);
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        window.addEventListener('resize', () => {
            setTimeout(fixExistingCanvases, 100);
        });
    }
    public static forceFixCanvas(): void {
        document.querySelectorAll('canvas').forEach(canvas => {
            const rect = canvas.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                const htmlCanvas = canvas as HTMLCanvasElement;
                htmlCanvas.width = rect.width;
                htmlCanvas.height = rect.height;
            }
        });
    }
}