import type {Request, Response} from 'express';
import express from 'express';
import * as userValidator from '../user/middleware';
import * as util from './util';
import * as feedValidator from '../feed/middleware';
import FeedCollection from './collection';

const router = express.Router();

/**
 * Refresh Feed of owner.
 *
 * @name GET /api/feeds
 *
 * @return {FeedResponse} - A refreshed feed owned by user with id, ownerId
 * @throws {403} - if the user is not logged in or not the owner of
 *                 of the feed
 * @throws {404} - If the feedId is not valid
 */
router.get(
  '/',
  [
    userValidator.isUserLoggedIn,
    feedValidator.isFeedExists,
    feedValidator.isFeedOwner
  ],
  async (req: Request, res: Response) => {
    const feed = await FeedCollection.refreshFeed(req.session.userId);
    res.status(200).json({
      message: 'Feed successfully refreshed',
      feed: util.constructFeedResponse(feed)
    });
  }
);

/**
 * Modify the feed's filter
 *
 * @name PUT /api/feed/:activeFilter
 *
 * @param {string} activeFilter - the new active filter for the feed
 * @return {FeedResponse} - the updated feed
 * @throws {403} - if the user is not logged in or not the owner of
 *                 of the feed
 * @throws {404} - If the feedId is not valid
 */
router.put(
  '/:activeFilter?',
  [
    userValidator.isUserLoggedIn,
    feedValidator.isFeedExists,
    feedValidator.isFeedOwner
  ],
  async (req: Request, res: Response) => {
    const feed = await FeedCollection.updateActiveFilter(req.session.userId, req.params.activeFilter);
    res.status(200).json({
      message: `Your feed will now show ${feed.activeFilter} freets.`,
      feed: util.constructFeedResponse(feed)
    });
  }
);

export {router as feedRouter};
