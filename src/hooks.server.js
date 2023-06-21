const preloadTypes = [ 'js', 'css', 'font' ];

export function handle ({ event, resolve }) {
    if (event.url.pathname.startsWith('/docs/')) {
        return new Response(undefined, {
            status: 308,
            headers: {
                location: `/${event.url.pathname.substring(6)}`
            }
        });
    }

    return resolve(event, {
        preload: ({ type }) => preloadTypes.includes(type)
    });
}
