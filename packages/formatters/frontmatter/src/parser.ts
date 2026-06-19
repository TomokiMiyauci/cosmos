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

  stringify(data: Data): string {
    return matter.stringify(data.body, { header: data.header }, {
      engines: {
        custom: {
          parse(content): { header: string } {
            return { header: content };
          },
          stringify(): string {
            return data.header;
          },
        },
      },
      language: "custom",
    });
  }
}

interface Data {
  header: string;
  body: string;
}
