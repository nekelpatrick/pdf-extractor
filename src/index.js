const fs = require('fs');
const path = require('path');
const markdownpdf = require('markdown-pdf');

function convertMarkdownToPdf(dir) {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, async (err, files) => {
            if (err) {
                return reject(err);
            }
            const markdownFiles = files.filter(file => path.extname(file) === '.md');

            const markdownContent = [];
            for (const file of markdownFiles) {
                const filePath = path.join(dir, file);
                const content = fs.readFileSync(filePath, 'utf-8');

                // Split the content by lines
                const lines = content.split('\n');
                for (let i = 0; i < lines.length; i++) {
                 // Check if the line is uppercase and is not empty
                 // This RegExp will match if the line contains only uppercase letters (including accented), digits, spaces, or punctuation
                 if (lines[i].match(/^[\p{Lu}\p{N}\p{Z}\p{P}]+$/u) && lines[i].trim() !== '') {
                     // Add '### ' before the line
                     lines[i] = `### ${lines[i]}`;
                 }
             }
                                          // Join the lines back into a string
                const formattedContent = lines.join('\n');

                // Skip adding a title if it's the main title markdown file
                if (file !== '0_title.md') {
                    const title = `## ${path.basename(file, '.md')}\n\n`;
                    markdownContent.push(title + formattedContent);
                } else {
                    markdownContent.push(formattedContent);
                }
            }

            const outputFile = path.join(dir, 'merged.md');
            fs.writeFileSync(outputFile, markdownContent.join('\n'), 'utf-8');
            resolve(outputFile);
        });
    });
}

function deleteOriginalPdfFiles(dir) {
    const files = fs.readdirSync(dir);
    const pdfFiles = files.filter(file => path.extname(file) === '.pdf');

    for (const file of pdfFiles) {
        fs.unlinkSync(path.join(dir, file));
    }
}

function deleteMergedMarkdownFile(dir) {
    const mergedFilePath = path.join(dir, 'merged.md');
    if (fs.existsSync(mergedFilePath)) {
        fs.unlinkSync(mergedFilePath);
    }
}

const dir = './markdown-29-07';  // directory containing markdown files
const output = './output/output.pdf';  // output PDF file
const title = '# World of Elfaer: Lore and History\n\n';  // Main title with h1

fs.writeFileSync(path.join(dir, '0_title.md'), title, 'utf-8');

convertMarkdownToPdf(dir)
    .then(markdownFile => {
        const pdfOptions = {
            cssPath: './custom.css', // Path to custom CSS file
            paperFormat: 'Letter'
        };

        markdownpdf(pdfOptions).from(markdownFile).to(output, () => {
            console.log(`PDF file is saved as ${output}`);
            deleteOriginalPdfFiles(dir); // Call the function to delete original PDF files
            deleteMergedMarkdownFile(dir); // Delete the merged markdown file
        });
    })
    .catch(err => console.error(err));
