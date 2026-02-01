export function blocksToHtml(blocks: any[]): string {
    if (!blocks || !Array.isArray(blocks)) return "";

    return blocks.map(block => {
        switch (block.type) {
            case "paragraph":
                return `<p>${block.content}</p>`;
            case "h1":
                return `<h1>${block.content}</h1>`;
            case "h2":
                return `<h2>${block.content}</h2>`;
            case "h3":
                return `<h3>${block.content}</h3>`;
            case "faq":
                return `
                    <div class="faq">
                        ${(block.content.items || []).map((item: any) => `
                            <div class="faq-item">
                                <p><strong>Q: ${item.question}</strong></p>
                                <p>A: ${item.answer}</p>
                            </div>
                        `).join('')}
                    </div>
                `;
            case "howto":
                return `
                    <div class="howto">
                        ${block.content.name ? `<h3>${block.content.name}</h3>` : ''}
                        <ol>
                            ${(block.content.steps || []).map((step: any) => `
                                <li>
                                    <strong>${step.title}</strong><br/>
                                    ${step.blocks && Array.isArray(step.blocks) && step.blocks.length > 0
                        ? blocksToHtml(step.blocks)
                        : (step.text || "").replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')}
                                </li>
                            `).join('')}
                        </ol>
                    </div>
                `;
            case "table":
                return `
                    <table border="1">
                        <thead>
                            <tr>
                                ${(block.content.headers || []).map((h: string) => `<th>${h}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${(block.content.rows || []).map((row: string[]) => `
                                <tr>
                                    ${row.map(cell => `<td>${cell}</td>`).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            case "video":
                return `<p><a href="https://youtube.com/watch?v=${block.content}">Watch Video on YouTube</a></p>`;
            case "review":
                return `
                    <div class="review">
                        <p><strong>Review for: ${block.content.itemName}</strong></p>
                        <p>Rating: ${block.content.rating}/5</p>
                        <p>${block.content.text}</p>
                        <p>— ${block.content.author}</p>
                    </div>
                `;
            case "image":
                return `
                    <figure>
                        <img src="${block.content.url}" alt="${block.content.alt || ''}">
                        ${block.content.caption ? `<figcaption>${block.content.caption}</figcaption>` : ''}
                    </figure>
                `;
            case "gallery":
                return `
                    <div class="gallery">
                        ${(block.content.items || []).map((item: any) => `
                            <figure>
                                <img src="${item.url}" alt="">
                                ${item.caption ? `<figcaption>${item.caption}</figcaption>` : ''}
                            </figure>
                        `).join('')}
                    </div>
                `;
            case "quote":
                return `
                    <blockquote>
                        <p>${block.content.text}</p>
                        ${block.content.author ? `<cite>— ${block.content.author}</cite>` : ''}
                    </blockquote>
                `;
            case "code":
                return `<pre><code>${block.content.code}</code></pre>`;
            case "list":
                const Tag = block.content.style === "numbered" ? "ol" : "ul";
                return `
                    <${Tag}>
                        ${(block.content.items || []).map((item: string) => `<li>${item}</li>`).join('')}
                    </${Tag}>
                `;
            case "callout":
                return `
                    <div class="callout" style="border: 1px solid #ccc; padding: 10px; margin: 10px 0;">
                        <p><strong>${block.content.type.toUpperCase()}:</strong> ${block.content.text}</p>
                    </div>
                `;
            case "divider":
                return `<hr/>`;
            default:
                return "";
        }
    }).join('\n');
}
