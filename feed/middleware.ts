import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import FeedCollection from '../feed/collection';
import UserCollection from '../user/collection';

/**
 * Checks if a Feed with ownerId in req.params exists
 */
const isFeedExists = async (req: Request, res: Response, next: NextFunction) => {
  const user = await UserCollection.findOneByUserId(req.session.userId);
  const feed = await FeedCollection.findOneByUser(user._id) ?? '';
  if (!feed) {
    res.status(404).json({
      error: {
        feedNotFound: `Feed for ${req.session.userId as string} does not exist.`
      }
    });
    return;
  }

  next();
};

/**
 * Checks if the current user is the owner of the feed whose feedId is in req.body
 */
const isFeedOwner = async (req: Request, res: Response, next: NextFunction) => {
  const feed = await FeedCollection.findOneByUser(req.session.userId);
  const userId = feed.ownerId._id;
  if (req.session.userId !== userId.toString()) {
    res.status(403).json({
      error: 'You are not the owner of this feed.'
    });
    return;
  }

  next();
};

export {
  isFeedExists,
  isFeedOwner
};
