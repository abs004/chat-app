import User from "../models/User.js";
import Conversation from "../models/Conversation.js";
import Report from "../models/Report.js";
import Message from "../models/Message.js";
import Feedback from "../models/Feedback.js";
import { scheduleMessageDeletion } from "../utils/messageCleanup.js";

// ── GET /admin/stats ──────────────────────────────────────────────────────────

/**
 * Returns high-level platform statistics.
 */
export const handleGetStats = async (req, res, next) => {
  try {
    const [totalUsers, activeChats, totalReports, pendingReports, bannedUsers] =
      await Promise.all([
        User.countDocuments(),
        Conversation.countDocuments({ isActive: true }),
        Report.countDocuments(),
        Report.countDocuments({ status: "pending" }),
        User.countDocuments({ isBanned: true }),
      ]);

    return res.json({ totalUsers, activeChats, totalReports, pendingReports, bannedUsers });
  } catch (err) {
    next(err);
  }
};

// ── GET /admin/reports ────────────────────────────────────────────────────────

/**
 * Returns all reports, optionally filtered by status.
 * Populates reporter and reported email fields.
 */
export const handleGetReports = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const reports = await Report.find(filter)
      .populate("reporter", "email")
      .populate("reported", "email")
      .sort({ createdAt: -1 });

    return res.json(reports);
  } catch (err) {
    next(err);
  }
};

// ── GET /admin/reports/:conversationId/messages ───────────────────────────────

/**
 * Returns messages for a reported conversation.
 * Rejects non-reported conversations to prevent privacy abuse.
 */
export const handleGetReportMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    if (!conversation.reported) {
      return res.status(403).json({ message: "This conversation has not been reported" });
    }

    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: 1 })
      .populate("sender", "email");

    const formatted = messages.map(msg => ({
      _id: msg._id,
      content: msg.content,
      createdAt: msg.createdAt,
      sender: msg.sender?.email?.split("@")[0] ?? msg.sender,
    }));

    return res.json(formatted);
  } catch (err) {
    next(err);
  }
};

// ── PATCH /admin/reports/:reportId ────────────────────────────────────────────

/**
 * Updates the status of a report ("reviewed" or "dismissed").
 * If dismissed, resumes the scheduled message deletion timer.
 */
export const handleUpdateReportStatus = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const { status } = req.body;

    if (!["reviewed", "dismissed"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'reviewed' or 'dismissed'" });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    report.status = status;
    await report.save();

    // Dismissed → resume deletion timer since admin review is done
    if (status === "dismissed") {
      scheduleMessageDeletion(report.conversationId);
    }

    return res.json(report);
  } catch (err) {
    next(err);
  }
};

// ── GET /admin/users ──────────────────────────────────────────────────────────

/**
 * Returns all users, optionally filtered by email search string.
 */
export const handleGetUsers = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.search) {
      filter.email = { $regex: req.query.search, $options: "i" };
    }

    const [users, reportCounts] = await Promise.all([
      User.find(filter)
        .select("email createdAt isVerified isBanned banExpiresAt isAdmin banHistory")
        .sort({ createdAt: -1 }),
      Report.aggregate([
        { $group: { _id: "$reported", count: { $sum: 1 } } },
      ]),
    ]);

    // Build a fast lookup map: userId → report count
    const countMap = new Map(
      reportCounts.map((r) => [r._id.toString(), r.count])
    );

    const result = users.map((u) => ({
      ...u.toObject(),
      reportCount: countMap.get(u._id.toString()) ?? 0,
    }));

    return res.json(result);
  } catch (err) {
    next(err);
  }
};

// ── PATCH /admin/users/:userId/ban ────────────────────────────────────────────

/**
 * Bans a user. Duration can be "1d", "7d", or "permanent".
 * Cannot ban yourself or another admin.
 */
export const handleBanUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { duration } = req.body;

    if (!["1d", "7d", "permanent"].includes(duration)) {
      return res.status(400).json({ message: "Duration must be '1d', '7d', or 'permanent'" });
    }

    if (req.user.userId === userId) {
      return res.status(400).json({ message: "You cannot ban yourself" });
    }

    const target = await User.findById(userId);
    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }
    if (target.isAdmin) {
      return res.status(403).json({ message: "Cannot ban another admin" });
    }

    let banExpiresAt = null;
    if (duration === "1d") banExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    if (duration === "7d") banExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    // "permanent" leaves banExpiresAt as null

    const updated = await User.findByIdAndUpdate(
      userId,
      {
        $set: { isBanned: true, banExpiresAt },
        $push: { banHistory: { duration, bannedAt: new Date() } },
      },
      { new: true, select: "email createdAt isVerified isBanned banExpiresAt isAdmin banHistory" }
    );

    return res.json(updated);
  } catch (err) {
    next(err);
  }
};

// ── PATCH /admin/users/:userId/unban ──────────────────────────────────────────

/**
 * Lifts a ban from a user.
 */
export const handleUnbanUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const updated = await User.findByIdAndUpdate(
      userId,
      { isBanned: false, banExpiresAt: null },
      { new: true, select: "email createdAt isVerified isBanned banExpiresAt isAdmin" }
    );

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(updated);
  } catch (err) {
    next(err);
  }
};

// ── GET /admin/users/:userId/reports ─────────────────────────────────────────

/**
 * Returns all reports filed against a specific user.
 */
export const handleGetUserReports = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const reports = await Report.find({ reported: userId })
      .populate("reporter", "email")
      .sort({ createdAt: -1 });

    return res.json(reports);
  } catch (err) {
    next(err);
  }
};

// ── GET /admin/feedback ───────────────────────────────────────────────────────

/**
 * Returns all user feedback sorted by newest first.
 */
export const handleGetFeedback = async (req, res, next) => {
  try {
    const feedbackList = await Feedback.find()
      .populate("userId", "email")
      .sort({ createdAt: -1 });

    const mapped = feedbackList.map((f) => ({
      _id: f._id,
      comment: f.comment,
      createdAt: f.createdAt,
      username: f.userId?.email ? f.userId.email.split("@")[0] : "Unknown",
    }));

    return res.json(mapped);
  } catch (err) {
    next(err);
  }
};
