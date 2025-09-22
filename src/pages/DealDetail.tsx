import React, { useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { createClient } from "../utils/client";
import { useAppContext } from "../context/AppContext";
import { PortableText } from "@portabletext/react";
import { transformToPortableText } from "@kontent-ai/rich-text-resolver";
import { defaultPortableRichTextResolvers } from "../utils/richtext";
import { IRefreshMessageData, IRefreshMessageMetadata, IUpdateMessageData, applyUpdateOnItemAndLoadLinkedItems } from "@kontent-ai/smart-link";
import { useCustomRefresh, useLivePreview } from "../context/SmartLinkContext";
import {
  createElementSmartLink,
  createItemSmartLink,
} from "../utils/smartlink";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// import Deal from "../components/deal/Deal";
import { DealsType, LanguageCodenames } from "../model";

const BlogDetail: React.FC = () => {
  const { environmentId, apiKey } = useAppContext();
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const lang = searchParams.get("lang");
  const queryClient = useQueryClient();

  const dealQuery = useQuery({
    queryKey: [`deal-detail_${slug}`, isPreview, lang],
    queryFn: async () => {
      const client = createClient(environmentId, apiKey, isPreview);

      console.log("Looking for deal with slug:", slug);
      
      // Since DealsType doesn't have url_slug, we'll use the system codename
      const response = await client
        .items<DealsType>()
        .type("deals")
        .equalsFilter("system.codename", slug ?? "")
        .languageParameter((lang ?? "default") as LanguageCodenames)
        .toPromise()

      console.log("Deal query response:", response);
      console.log("Found deals:", response.data.items.length);
      
      return response.data.items[0] ?? null;


    }
  });




  const handleLiveUpdate = useCallback((data: IUpdateMessageData) => {
    if (dealQuery.data) {
      applyUpdateOnItemAndLoadLinkedItems(
        dealQuery.data,
        data,
        (codenamesToFetch) => createClient(environmentId, apiKey, isPreview)
          .items()
          .inFilter("system.codename", [...codenamesToFetch])
          .toPromise()
          .then(res => res.data.items as DealsType[])
      ).then((updatedItem) => {
        if (updatedItem) {
          queryClient.setQueryData([`deals_${slug}`, isPreview, lang], updatedItem);
        }
      });
    }
  }, [dealQuery.data, environmentId, apiKey, isPreview, slug, lang, queryClient]);

  useLivePreview(handleLiveUpdate);

  const onRefresh = useCallback(
    (_: IRefreshMessageData, metadata: IRefreshMessageMetadata, originalRefresh: () => void) => {
      if (metadata.manualRefresh) {
        originalRefresh();
      } else {
        dealQuery.refetch();
      }
    },
    [dealQuery],
  );

  useCustomRefresh(onRefresh);

  const deal = dealQuery.data;

  if (!deal) {
    return <div className="flex-grow" />;
  }

  const createTag = (tag: string) => (
    <div className="w-fit text-small border tracking-wider font-[700] text-grey border-azure px-4 py-2 rounded-lg uppercase">
      {tag}
    </div>
  );

  return (
    <div className="container flex flex-col gap-12 px-3">
      <div className="flex flex-row items-center pt-[104px] pb-[160px]">
        <div className="flex flex-col flex-1 gap-6 ">
          {createTag("Deal")}
          <h1 className="text-heading-1 text-heading-1-color mb-6 max-w-[12ch]"
          {...createItemSmartLink(deal.system.id)}
          {...createElementSmartLink("title")}
          >
            {deal.elements.deal_title?.value}
          </h1>
        </div>
        <div className="flex flex-col flex-1">
          <img
            width={670}
            height={440}
            src={deal.elements.deal_image?.value[0]?.url}
            alt={deal.elements.deal_image?.value[0]?.description ?? ""}
            className="rounded-lg"
          />
        </div>
      </div>
      <div className="rich-text-body max-w-3xl mx-auto flex flex-col gap-5"
      {...createItemSmartLink(deal.system.id)}
      {...createElementSmartLink("body")}>
        <PortableText
          value={transformToPortableText(deal.elements.body?.value)}
          components={defaultPortableRichTextResolvers}
        />
      </div>
    </div>
  );
};

export default BlogDetail;
