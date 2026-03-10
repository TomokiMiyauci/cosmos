import matter from "gray-matter";

export class Frontmatter {
  parse(content: string): Data {
    const result = matter(content, {
      engines: {
        custom: {
          parse(content): { header: string } {
            return { header: content };
          },
        },
      },
      language: "custom",
    });

    const body = result.content;
    const header = result.data.header ?? "";

    return { body, header };
  }

  stringify(): string {
    throw new Error("unimplemented");
  }
}

interface Data {
  header: string;
  body: string;
}
