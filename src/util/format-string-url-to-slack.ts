export function formatStringUrlToSlack(stringUrl: string): ClipboardItem[] {
    const url = new URL(stringUrl);
    const encodedUrl = encodeURI(url.toString());
    const hasKey = url.searchParams.has("csic-key");
    if (hasKey) {
        const key = url.searchParams.get("csic-key");
        const htmlText = `<a target="_blank" href="${encodedUrl}" rel="noopener noreferrer">${key}</a>`
        const clipData = {
            ["text/html"]: htmlText,
            ["text/plain"]: url.toString(),
        }
        return [new ClipboardItem(clipData)];
    } else {
        const clipData = {
            ["text/plain"]: url.toString(),
        }
        return [new ClipboardItem(clipData)];
    }


}