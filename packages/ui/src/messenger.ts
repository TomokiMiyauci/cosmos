export interface Messenger {
  message(subject: Subject): string;
}

export type Subject = SaveSubject | ActionSubject | PageTitleSubject;

interface ActionSubject {
  type: "action";
  action: Action;
}

type Action = "create";

export interface SaveSubject {
  type: "save";
}

export interface PageTitleSubject {
  type: "page-title";
  page: PageKind;
}

export type PageKind = "Home" | "Entries" | "Entry";

export class EnMessenger implements Messenger {
  message(subject: Subject): string {
    switch (subject.type) {
      case "save": {
        return "Save";
      }
      case "page-title": {
        switch (subject.page) {
          case "Home": {
            return "Home";
          }
          case "Entries": {
            return "Entries";
          }
          case "Entry": {
            return "Entry";
          }
        }
        break;
      }
      case "action": {
        switch (subject.action) {
          case "create":
            return "Create";
        }
      }
    }
  }
}
