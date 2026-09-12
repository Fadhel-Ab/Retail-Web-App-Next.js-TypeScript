"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { number } from "zod";

type PaginationProps = {
  page: number | string;
  totalPages: number;
  urlParamName?: string;
  locale?: string;
};

const Pagination = ({ page, totalPages, urlParamName, locale = "en" }: PaginationProps) => {
  const isAr = locale !== "en";
  const router = useRouter();
  const searchParams = useSearchParams();

  const onClick = (type: string) => {
    // calc pages
    const pageValue = type === "prev" ? Number(page) - 1 : Number(page) + 1;
    //create url using search params
    const params = new URLSearchParams(searchParams.toString());
    params.set(urlParamName || "page", pageValue.toString());

    // update url search params
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  };

  return (
    <div className="flex gap-2  items-center ">
      <Button
        size="lg"
        variant={"outline"}
        className={"w-28"}
        disabled={Number(page) <= 1}
        onClick={() => onClick("prev")}
      >
        {isAr ? "السابق" : "Previous"}
      </Button>
      <span>{page}</span>
      <Button
        size="lg"
        variant={"outline"}
        className={"w-28"}
        disabled={Number(page) >= totalPages}
        onClick={() => onClick("next")}
      >
        {isAr ? "التالي" : "Next"}
      </Button>
    </div>
  );
};

export default Pagination;
