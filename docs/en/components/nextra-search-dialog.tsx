'use client'

import {useEffect, useRef, useState} from "react";
import {CommandDialog, CommandEmpty, CommandGroup, CommandItem, CommandList} from "@/components/ui/command";
import {addBasePath} from 'next/dist/client/add-base-path';
import {SearchIcon} from "lucide-react";
import {Command as CommandPrimitive} from "cmdk";
import {cn} from "@/lib/utils";
import {useRouter} from "next/navigation";
import {PageItem} from "@/lib/getPagesFromPageMap";
import {Kbd} from "@/components/ui/kbd";

type Props = {
    placeholder?: string;
    pages?: PageItem[];
};
type OnSelect = (url: string) => void;

export function NextraSearchDialog({placeholder = "Search...", pages = []}: Props) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<PagefindResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const instanceId = useRef(Math.random().toString()).current;
    const [canRender, setCanRender] = useState(false);

    useEffect(() => {
        if (activeSearchInstances.size > 0) {
            return; // Another instance exists, don't render
        }
        activeSearchInstances.add(instanceId);
        setCanRender(true);

        return () => {
            activeSearchInstances.delete(instanceId);
        };
    }, [instanceId]);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
            if (e.key === "Escape") {
                e.preventDefault();
                setOpen(false);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    useEffect(() => {
        if (!open) {
            setQuery("");
            setResults([]);
            setError("");
        }
    }, [open]);

    useEffect(() => {
        let active = true;
        const handleSearch = async (value: string) => {
            if (!value) {
                if (!active) return;
                setResults([]);
                setError("");
                setLoading(false);
                return;
            }

            setLoading(true);

            if (!window.pagefind) {
                try {
                    await importPagefind();
                } catch (err) {
                    if (!active) return;
                    setError("Failed to load search index.");
                    setLoading(false);
                    return;
                }
            }

            try {
                const response = await window.pagefind!.debouncedSearch<PagefindResult>(value);
                if (!active) return;
                if (!response) {
                    setResults([]);
                    setLoading(false);
                    return;
                }

                const data = await Promise.all(response.results.map(o => o.data()));

                const processedResults = data.map(newData => ({
                    ...newData,
                    sub_results: (newData.sub_results || []).map(r => {
                        const url = r.url.replace(/\.html$/, '').replace(/\.html#/, '#');
                        return {...r, url};
                    })
                }));

                setResults(processedResults);
                setLoading(false);
                setError("");
            } catch (err) {
                if (!active) return;
                setError("Search failed.");
                setLoading(false);
            }
        };

        handleSearch(query);
        return () => {
            active = false;
        };
    }, [query]);

    if (!canRender) return null;

    const handleResultClick = (url: string) => {
        setOpen(false);
        router.push(url);
    };


    function SearchContent() {
        if (!query) return <SearchWelcomePages pages={pages} onSelect={handleResultClick}/>;
        if (error) return <SearchError message={error}/>;
        if (loading) return <SearchLoading/>;
        if (!results || results.length === 0) return <SearchNoResults/>;
        return <SearchResults results={results} query={query} onSelect={handleResultClick}/>;
    }

    return (
        <>
            <SearchTrigger placeholder={placeholder} onClick={() => setOpen(true)}/>

            <CommandDialog open={open} onOpenChange={setOpen}
                           showCloseButton={false}
                           className="search-dialog !max-w-[800px] overflow-hidden !bg-transparent px-2 border-none [&_.bg-popover]:bg-transparent">

                <div className="border-4 rounded-2xl bg-background">
                    <SearchInput
                        placeholder={placeholder}
                        query={query}
                        onQueryChange={setQuery}
                    />

                    <CommandList className="h-96" aria-label="Search results list">
                        <SearchContent/>
                    </CommandList>
                </div>

            </CommandDialog>
        </>
    );
}

function SearchWelcomePages(
    {pages = [], onSelect}:
    {
        pages: PageItem[],
        onSelect?: OnSelect
    }) {
    if (pages.length === 0) {
        return null;
    }

    return (
        <CommandGroup heading="Pages">
            {pages.map(({title, url, parent, description}, index) => (
                <SearchItem
                    key={`${url}-${index}`}
                    value={title}
                    title={title}
                    parent={parent}
                    onSelect={() => onSelect(url)}
                    description={description}
                />
            ))}
        </CommandGroup>
    );
}

function SearchInput({
                         placeholder, query, onQueryChange,
                     }: {
    placeholder: string;
    query: string;
    onQueryChange: (value: string) => void;
}) {
    return (
        <div className="p-2">
            <div className="bg-input h-10 w-full flex items-center gap-2 rounded-lg px-3">
                <SearchIcon className="size-4 shrink-0 opacity-50"/>
                <CommandPrimitive.Input
                    data-slot="command-input"
                    className={cn(
                        "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
                    )}
                    placeholder={placeholder}
                    value={query}
                    onValueChange={onQueryChange}
                />
            </div>
        </div>
    )
}


function SearchTrigger({placeholder, onClick}: { placeholder: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "inline-flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:border-gray-300 dark:hover:border-white/40",
                "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
            )}
        >
            <SearchIcon className="size-4"/>
            <span>{placeholder}</span>
            <Kbd><span className="text-xs">⌘</span>K</Kbd>
        </button>
    );
}

function SearchLoading() {
    return (
        <div className="py-6 text-center text-sm text-gray-500">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            <span className="ml-2">Searching...</span>
        </div>
    );
}

function SearchError({message}: { message: string }) {
    return (
        <div className="py-6 px-4 text-center text-sm text-red-500">
            {message}
        </div>
    );
}

function SearchNoResults() {
    return <CommandEmpty>No results found.</CommandEmpty>;
}

function SearchResultItem({subResult, parentTitle, query, onSelect}: {
    subResult: PagefindResult['sub_results'][0];
    parentTitle: string;
    query: string;
    onSelect: OnSelect
}) {
    const cleanExcerpt = (subResult.excerpt || '').replace(/<[^>]*>/g, '').substring(0, 100);

    return (
        <SearchItem url={subResult.url}
                    title={highlightQuery(subResult.title || '', query)}
                    description={<>{highlightQuery(cleanExcerpt, query)}...</>}
                    onSelect={onSelect}
                    value={`${parentTitle} ${subResult.title}`}
        />
    );
}

function SearchItem({url, title, description, onSelect, value, parent}: {
    url?: string;
    parent?: string;
    title: any | string;
    description: any | string;
    onSelect?: OnSelect;
    value?: string;
}) {
    return (
        <CommandItem onSelect={() => onSelect(url)} value={value} className="cursor-pointer">
            <div className="flex flex-col gap-1 w-full">
                <div className="flex items-center gap-1">
                    {parent && (
                        <>
                            <span className="text-xs text-muted-foreground">{parent}</span>
                            <span className="text-xs text-muted-foreground">/</span>
                        </>
                    )}
                    <div className="font-semibold">{title}</div>
                </div>
                <div className="text-xs text-muted-foreground">
                    {description}
                </div>
            </div>
        </CommandItem>
    )
}

function SearchResults({results, query, onSelect}: {
    results: PagefindResult[];
    query: string;
    onSelect: OnSelect
}) {
    return (
        <>
            {results.map((result) => (
                <CommandGroup
                    key={result.url}
                    heading={result.meta.title}
                >
                    {(result.sub_results || []).map((subResult) => (
                        <SearchResultItem
                            key={subResult.url}
                            subResult={subResult}
                            parentTitle={result.meta.title}
                            query={query}
                            onSelect={() => onSelect(subResult.url)}
                        />
                    ))}
                </CommandGroup>
            ))}
        </>
    );
}

function escapeRegExp(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightQuery(text: string, query: string) {
    if (!query) return text;
    const cleanedQuery = escapeRegExp(query.trim());
    if (!cleanedQuery) return text;
    const regex = new RegExp(`(${cleanedQuery})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
        regex.test(part) ? <mark key={index} className="bg-primary text-primary-foreground rounded-[3px] font-medium">{part}</mark> : part
    );
}


declare global {
    interface Window {
        pagefind?: {
            debouncedSearch: <T>(query: string, options?: any) => Promise<{
                results: Array<{
                    data: () => Promise<T>;
                }>;
            } | null>;
            options: (options: { baseUrl: string }) => Promise<void>;
        };
    }
}

async function importPagefind() {
    if (window.pagefind) return;
    window.pagefind = await import(
        /* webpackIgnore: true */ addBasePath('/_pagefind/pagefind.js')
        );
    await window.pagefind.options({
        baseUrl: '/'
    });
}

type PagefindResult = {
    excerpt: string;
    meta: {
        title: string;
    };
    raw_url: string;
    sub_results: {
        excerpt: string;
        title: string;
        url: string;
    }[];
    url: string;
};
const activeSearchInstances = new Set<string>();