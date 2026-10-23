import { Skeleton } from "@heroui/react";
import React from "react";

export default function PostSkelton({ count = 3 }: { count?: number }) {
  return (
    <>
      {[0, 1, 2].slice(0, count).map((index) => {
        return (
          <React.Fragment key={index}>
            <div className="shadow-panel  space-y-5 rounded-lg bg-transparent p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10  shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-36 rounded-lg" />
                  <Skeleton className="h-3 w-24 rounded-lg" />
                </div>
              </div>
              <Skeleton className="h-32 rounded-lg" />
              <div className="space-y-3">
                <Skeleton className="h-3 w-3/5 rounded-lg" />
                <Skeleton className="h-3 w-4/5 rounded-lg" />
                <Skeleton className="h-3 w-2/5 rounded-lg" />
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
}
