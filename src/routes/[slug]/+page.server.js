import fs from 'fs';
import { base } from '$app/paths';
import { read_file } from '$lib/docs/server';
import { error } from '@sveltejs/kit';
import {extract_frontmatter} from "$lib/docs/server/markdown.js";

const base_dir = './documentation/docs';
const pattern = /^\d\d-/;

export const prerender = true;

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
    const sections = fs
        .readdirSync(base_dir)
        .filter((subdir) => pattern.test(subdir))
        .map((subdir) => {
            const meta = JSON.parse(fs.readFileSync(`${base_dir}/${subdir}/meta.json`, 'utf-8'));
            return {
                title: meta.title,
                pages: fs
                    .readdirSync(`${base_dir}/${subdir}`)
                    .filter((file) => pattern.test(file))
                    .map((file) => {
                        const markdown = fs.readFileSync(`${base_dir}/${subdir}/${file}`, 'utf-8');
                        const { metadata } = extract_frontmatter(markdown);

                        const slug = file.slice(3, -3);

                        return {
                            title: metadata.title,
                            path: `${base}/${slug}`
                        };
                    })
            };
        });

    for (const subdir of fs.readdirSync(base_dir)) {
        if (!fs.statSync(`${base_dir}/${subdir}`).isDirectory()) continue;

        for (const file of fs.readdirSync(`${base_dir}/${subdir}`)) {
            if (file.slice(3, -3) === params.slug) {
                return {
                    sections,
                    page: await read_file(`docs/${subdir}/${file}`)
                };
            }
        }
    }

    throw error(404);
}
