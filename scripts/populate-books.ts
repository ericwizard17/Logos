import { createClient } from '@supabase/supabase-js';
import { searchBooksByCategory, CATEGORIES, LANGUAGES } from '../src/lib/books';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function populateBooks() {
    console.log('🚀 Starting book population...\n');

    let totalAdded = 0;
    let totalSkipped = 0;

    for (const language of LANGUAGES) {
        console.log(`\n📚 Processing ${language.name} (${language.code})...`);

        const booksPerCategory = Math.ceil(language.count / CATEGORIES.length);

        for (const category of CATEGORIES) {
            console.log(`  📖 Fetching ${category} books...`);

            try {
                const books = await searchBooksByCategory(
                    category,
                    language.code,
                    booksPerCategory
                );

                for (const book of books) {
                    // Check if book already exists (by ISBN or title+author)
                    const { data: existing } = await supabase
                        .from('books_catalog')
                        .select('id')
                        .or(`isbn.eq.${book.isbn},and(title.eq.${book.title},authors.cs.{${book.authors[0]}})`)
                        .limit(1);

                    if (existing && existing.length > 0) {
                        totalSkipped++;
                        continue;
                    }

                    // Insert book
                    const { error } = await supabase
                        .from('books_catalog')
                        .insert({
                            title: book.title,
                            authors: book.authors,
                            isbn: book.isbn,
                            language: book.language || language.code,
                            category: category,
                            page_count: book.pageCount,
                            thumbnail: book.thumbnail,
                            description: book.description,
                            publisher: book.publisher,
                            published_date: book.publishedDate,
                            source: 'openlibrary',
                            external_id: book.id,
                        });

                    if (!error) {
                        totalAdded++;
                        process.stdout.write(`\r  ✅ Added: ${totalAdded} | Skipped: ${totalSkipped}`);
                    }
                }

                // Rate limiting: 1 request per second
                await sleep(1000);

            } catch (error) {
                console.error(`\n  ❌ Error fetching ${category}:`, error);
            }
        }
    }

    console.log(`\n\n🎉 Population complete!`);
    console.log(`✅ Total books added: ${totalAdded}`);
    console.log(`⏭️  Total books skipped (duplicates): ${totalSkipped}`);
}

// Run the script
populateBooks()
    .then(() => {
        console.log('\n✨ Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Fatal error:', error);
        process.exit(1);
    });
