declare const chrome: any;
declare const browser: any;

type QueryParams = {
    organization: string | null;
    tenantName: string | null;
    scLang: string | null;
    scSite: string | null;
    scItemId: string | null;
};

const getQueryParam = (param: string): string | null => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get(param);
};

const constructExplorerUrl = (queryParams: QueryParams): string => {
    const { organization, tenantName, scLang, scSite, scItemId } = queryParams;
    return `https://explorer.sitecorecloud.io/columns?organization=${organization}&tenantName=${tenantName}&sc_lang=${scLang}&sc_site=${scSite}&sc_itemid=${scItemId}`;
};

const constructContentEditorUrl = (queryParams: QueryParams): string => {
    const { organization, tenantName, scLang, scItemId } = queryParams;
    return `https://xmc-${tenantName}.sitecorecloud.io/sitecore/shell/Applications/Content%20Editor.aspx?sc_bw=1&organization=${organization}&sc_lang=${scLang}&fo=${scItemId}`;
};

const createLinkSpan = (explorerUrl: string, contentEditorUrl: string): HTMLSpanElement => {
    const linkSpan = document.createElement('span');
    linkSpan.classList.add('xmcloud-extension-links');

    const explorerLink = createLinkElement(explorerUrl, 'Explorer');
    const contentEditorLink = createLinkElement(contentEditorUrl, 'Content Editor');

    linkSpan.appendChild(document.createTextNode('Open in '));
    linkSpan.appendChild(explorerLink);
    linkSpan.appendChild(document.createTextNode(' or '));
    linkSpan.appendChild(contentEditorLink);

    return linkSpan;
};

const createLinkElement = (url: string, text: string): HTMLAnchorElement => {
    const linkElement = document.createElement('a');
    linkElement.classList.add('xmcloud-extension-link');
    linkElement.href = url;
    linkElement.innerText = text;
    linkElement.target = '_blank';
    return linkElement;
};

const datasourceViewer = () => {

    // Choose the storage API based on the browser
    const storageAPI = chrome?.storage?.sync || browser.storage.sync;

    // Check if storageAPI is defined (if running in a non-extension context)
    if (!storageAPI) {
        console.error('Storage API is not available. Make sure you are running in a supported browser environment.');
        return;
    }

    // Retrieve extension settings
    storageAPI.get('datasourceEnabled').then((result) => {
        const isDatasourceEnabled = result?.datasourceEnabled ?? true;

        // Check if the feature is enabled before starting the observer
        if (isDatasourceEnabled) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((addedNode) => {
                        if (addedNode instanceof HTMLElement && addedNode.closest('app-datasource-picker')) {
                            console.debug('DOM changed from extension within app-datasource-picker');

                            const elementsWithDataItemId = addedNode.querySelectorAll('[data-itemid]') as NodeListOf<HTMLElement>;

                            elementsWithDataItemId.forEach((element: HTMLElement) => {
                                const itemId = element.getAttribute('data-itemid');
                                const existingLinkSpan = element.querySelector('.xmcloud-extension-links');

                                if (!existingLinkSpan && itemId) {
                                    const queryParams: QueryParams = {
                                        organization: getQueryParam('organization'),
                                        tenantName: getQueryParam('tenantName'),
                                        scLang: getQueryParam('sc_lang'),
                                        scSite: getQueryParam('sc_site'),
                                        scItemId: itemId,
                                    };

                                    const explorerUrl = constructExplorerUrl(queryParams);
                                    const contentEditorUrl = constructContentEditorUrl(queryParams);
                                    const linkSpan = createLinkSpan(explorerUrl, contentEditorUrl);

                                    element.appendChild(linkSpan);
                                }
                            });
                        }
                    });
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true,
            });
        }
    });
};

export { datasourceViewer };
