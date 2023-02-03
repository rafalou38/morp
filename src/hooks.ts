import type { Handle } from '@sveltejs/kit';
 
export const handle = async ({ event, resolve }) => {
//   if (event.url.pathname.startsWith('/custom')) {
//     return new Response('custom response');
//   }

    console.log("hanfeee");
    
 
  const response = await resolve(event);
  return response;
}