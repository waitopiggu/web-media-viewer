import React from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { Box } from '@mui/material';
import { ToggleOff, ToggleOn } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { actions } from '../../store';
import { appBarHeight, directoryListWidth } from '../../shared/variables'
import Controls from './Controls';

/**
 * Media Video Component
 */
export default () => {
  const dispatch = useDispatch()
  const store = useStore();
  const media = useSelector((state) => state.media);
  const videoAutoplay = useSelector((state) => state.video.autoplay);
  const videoLoop = useSelector((state) => state.video.loop);
  const videoPlaybackRate = useSelector((state) => state.video.playbackRate);
  const videoRef = React.useRef(0);
  const videoTime = React.useRef(0);

  const Video = styled('video')({
    backgroundColor: 'black',
    maxWidth: '100%',
    maxHeight: '100%',
    width: '100%',
    height: '100%',
  });

  const menuItems = React.useMemo(() => [
    {
      Icon: videoAutoplay ? ToggleOn : ToggleOff,
      onClick: () => dispatch(actions.video.merge({ autoplay: !videoAutoplay })),
      label: 'Autoplay',
    },
    {
      Icon: videoLoop ? ToggleOn : ToggleOff,
      onClick: () => dispatch(actions.video.merge({ loop: !videoLoop })),
      label: 'Loop',
    },
  ], [videoAutoplay, videoLoop]);

  const onVideoAttrChanging = () => {
    if (videoRef.current) {
      videoTime.current = videoRef.current.currentTime;
    }
  };

  const makeVideoAttrStateChange = (attrs) => () => {
    if (videoRef.current) {
      const next = attrs.reduce((payload, attrName) => ({
        ...payload, [attrName]: videoRef.current[attrName],
      }), {});
      dispatch(actions.video.merge(next));
    }
  };

  const setVideoAttr = React.useCallback(() => {
    if (videoRef.current) {
      const state = store.getState();
      const video = state.video;
      videoRef.current.muted = video.muted;
      videoRef.current.playbackRate = video.playbackRate;
      videoRef.current.volume = video.volume;
    }
  }, []);

  React.useEffect(setVideoAttr, [media, store]);

  React.useEffect(() => {
    setVideoAttr();
    if (videoRef.current && videoTime.current) {
      videoRef.current.currentTime = videoTime.current;
    }
  }, [videoAutoplay, videoLoop, videoPlaybackRate]);

  return (
    <Box sx={{
      width: `calc(100% - ${directoryListWidth}px)`,
      height: `calc(100vh - ${appBarHeight * 2}px)`,
    }}>
      <Video
        autoPlay={videoAutoplay}
        controls
        loop={videoLoop}
        onRateChange={makeVideoAttrStateChange(['playbackRate'])}
        onVolumeChange={makeVideoAttrStateChange(['muted', 'volume'])}
        ref={videoRef}
        src={media.path}
      />
      <Controls menuItems={menuItems} onVideoAttrChanging={onVideoAttrChanging} />
    </Box>
  );
};
