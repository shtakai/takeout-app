import React from "react";

import dayjs from "dayjs";
import { lazy } from "@loadable/component";
import { Redirect, useParams, useHistory } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";

import { HStack, Box, AspectRatio, Container, Skeleton, Flex } from "@chakra-ui/react";
import { Tabs, Tab, TabList, TabPanels, TabPanel } from "@chakra-ui/react";

import { Api, Track } from "./Api";
import { ErrorAlert } from "./ErrorAlert";

import { ChatProvider } from "./ChatProvider";
const TrackView = lazy(() => import(/* webpackPrefetch: true */ "./TrackView"));

export const TrackPage: React.FC = () => {
  return (
    <ChatProvider>
      <TrackPageInner />
    </ChatProvider>
  );
};

export const TrackPageInner: React.FC = () => {
  const history = useHistory();
  const streamOptionState = Api.useTrackStreamOptions();
  const { slug: trackSlug } = useParams<{ slug: string }>();

  const { data: conferenceData, error: conferenceError, mutate: mutateConferenceData } = Api.useConference();

  React.useEffect(() => {
    if (!conferenceData) return;
    if (conferenceData.requested_at === 0) return; // Partially mutated by consumeIvsMetadata

    const now = dayjs();
    const isStale = conferenceData.stale_after && conferenceData.stale_after - 2 <= now.unix();
    console.log("conferenceData freshness", {
      isStale,
      now: now.toISOString(),
      at: dayjs.unix(conferenceData.requested_at).toISOString(),
      stale_after: dayjs.unix(conferenceData.stale_after).toISOString(),
    });

    if (isStale) {
      console.log("conferenceData is stale; request revalidation");
      mutateConferenceData();
      const interval = setInterval(() => {
        console.log("Revalidating stale conferenceData...");
        mutateConferenceData();
      }, 1000);
      return () => clearInterval(interval);
    } else {
      console.log("conferenceData is fresh!");
    }
  }, [conferenceData?.requested_at, conferenceData?.stale_after]);

  if (!conferenceData) {
    return (
      <>
        {conferenceError ? (
          <Box my={2}>
            <ErrorAlert error={conferenceError} />
          </Box>
        ) : null}
        <TrackPageSkeleton />
      </>
    );
  }
  const conference = conferenceData?.conference;

  const trackIndex = conference.track_order.indexOf(trackSlug);
  const tracks = conference.track_order
    .filter((k) => conference.tracks.hasOwnProperty(k))
    .map((k) => conference.tracks[k]);

  const onTabChange = (_index: number) => {
    // Do nothing (RouterLink does all)
    // const slug = conference.track_order[index];
    //history.push(`/tracks/${slug}`);
  };

  return (
    <Tabs isLazy index={trackIndex} onChange={onTabChange} variant="rk-tracks">
      {trackIndex === -1 ? (
        <Redirect to={`/tracks/${encodeURIComponent(conferenceData.conference.default_track)}`} />
      ) : null}
      <TabList>
        {tracks.map((t) => (
          <Tab as={RouterLink} to={`/tracks/${encodeURIComponent(t.slug)}`} key={t.slug}>
            <TrackTabContent track={t} selected={t.slug === trackSlug} />
          </Tab>
        ))}
      </TabList>
      <TabPanels>
        {tracks.map((t) => {
          return (
            <TabPanel key={t.slug} p={0}>
              <React.Suspense fallback={<TrackViewSkeleton />}>
                <TrackView track={t} streamOptionsState={streamOptionState} />
              </React.Suspense>
            </TabPanel>
          );
        })}
      </TabPanels>
    </Tabs>
  );
};

const TrackTabContent: React.FC<{ track: Track; selected: boolean }> = ({ track, selected }) => {
  const topicTitle = track.card?.topic?.title;
  const [shouldShowTopic, setShouldShowTopic] = React.useState(true);
  const [isHovered, setIsHovered] = React.useState(false);
  const [hadHovered, setHadHovered] = React.useState(false);
  const [lastTopicTitle, setLastTopicTitle] = React.useState(topicTitle);

  React.useEffect(() => {
    if (lastTopicTitle !== topicTitle) {
      setLastTopicTitle(topicTitle);
      const timer = setTimeout(() => setShouldShowTopic(false), 5000);
      return () => clearTimeout(timer);
    } else if (isHovered) {
      setShouldShowTopic(true);
      setHadHovered(true);
    } else {
      const timer = setTimeout(() => setShouldShowTopic(false), hadHovered ? 500 : 5000);
      return () => clearTimeout(timer);
    }
  }, [topicTitle, shouldShowTopic, isHovered]);

  const topic = track.card?.topic;

  return (
    <HStack
      as="span"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      spacing={0}
      maxH="25px"
    >
      <span className="rk-tracks-tabs-name">{track.name}</span>
      {topic && !selected ? (
        <motion.span
          style={{ display: "inline-block", overflow: "hidden", maxHeight: "25px" }}
          animate={shouldShowTopic ? "open" : "closed"}
          variants={{
            open: { width: "auto", height: "auto", opacity: 1, transition: { duration: 0.25 } },
            closed: { width: 0, opacity: 0, transition: { duration: 0.75 } },
          }}
        >
          <span className="rk-tracks-tabs-topic-divider">{"–"}</span>
          <span className="rk-tracks-tabs-topic-title">{topic.title}</span>
          <span className="rk-tracks-tabs-topic-author">{topic.author !== "" ? `by ${topic.author}` : ""}</span>
        </motion.span>
      ) : null}
    </HStack>
  );
};

const TrackPageSkeleton: React.FC = () => {
  return (
    <Tabs>
      <TabList>
        <Tab>
          <Skeleton w="240px" h="25px" />
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel p={0}>
          <TrackViewSkeleton />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

const TrackViewSkeleton: React.FC = () => {
  return (
    <Container maxW={["auto", "auto", "auto", "1700px"]} px="15px" py="22px">
      <Flex alignItems="top" justifyContent="space-between" direction={["column", "column", "column", "row"]}>
        <Box w="100%">
          <AspectRatio ratio={16 / 9}>
            <Skeleton w="100%" h="100%" />
          </AspectRatio>
        </Box>

        <Box maxW={["auto", "auto", "auto", "400px"]} minH="400px" w="100%" ml="30px"></Box>
      </Flex>
      <Flex alignItems="top" justifyContent="space-between" direction={["column", "column", "column", "row"]} mt="12px">
        <Box w="100%">
          <Skeleton w="100%" h="100px" />
        </Box>
        <Box maxW={["auto", "auto", "auto", "400px"]} w="100%" ml="30px" />
      </Flex>
    </Container>
  );
};

export default TrackPage;
