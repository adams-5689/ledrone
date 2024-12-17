import React from "react";

export const Table: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className = "", children }) => (
  <div className={`w-full overflow-auto ${className}`}>
    <table className="w-full caption-bottom text-sm">{children}</table>
  </div>
);
export const TableHeader: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className = "", children }) => (
  <thead className={`[&_tr]:border-b ${className}`}>{children}</thead>
);

export const TableBody: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className = "", children }) => (
  <tbody className={`[&_tr:last-child]:border-0 ${className}`}>
    {children}
  </tbody>
);

export const TableFooter: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className = "", children }) => (
  <tfoot
    className={`bg-primary font-medium text-primary-foreground ${className}`}
  >
    {children}
  </tfoot>
);

export const TableRow: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className = "", children }) => (
  <tr
    className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`}
  >
    {children}
  </tr>
);

export const TableHead: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className = "", children }) => (
  <th
    className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}
  >
    {children}
  </th>
);

export const TableCell: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className = "", children }) => (
  <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}>
    {children}
  </td>
);

export const TableCaption: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className = "", children }) => (
  <caption className={`mt-4 text-sm text-muted-foreground ${className}`}>
    {children}
  </caption>
);
