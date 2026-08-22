import { useEffect } from 'react';
import { site } from '../content/site';

/**
 * Заголовок и описание страницы при переходах внутри приложения.
 * Статические копии страниц (scripts/seo.mjs) уже отдают правильные мета-теги
 * роботам при первой загрузке; здесь мы поддерживаем их в актуальном состоянии,
 * когда человек ходит по сайту без перезагрузки — это видно в истории браузера,
 * в закладках и при отправке ссылки в мессенджер.
 */
export default function usePageMeta(title, description) {
    useEffect(() => {
        const prevTitle = document.title;
        const tag = document.querySelector('meta[name="description"]');
        const prevDesc = tag?.getAttribute('content');

        document.title = title;
        if (description && tag) tag.setAttribute('content', description);

        return () => {
            document.title = prevTitle || site.title;
            if (prevDesc && tag) tag.setAttribute('content', prevDesc);
        };
    }, [title, description]);
}
