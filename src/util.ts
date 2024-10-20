export function getFetchParams(): RequestInit {
    return {
        credentials: "include",
        headers: {"X-Csrf-Token": getCsrfToken()}
    };
}

export function getCsrfToken() {
    const csrfTokenRegex = /csrf_token=(\S+)/
    let match = document.cookie.split("; ").map(c => c.match(csrfTokenRegex))!?.find(c => c !== null);
    if (match === undefined) {
        throw new Error(`Could not parse Csrf token: ${match}`);
    }
    return match[1];
}
