import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import Article from "@/lib/models/Article";
import { newsArticles } from "@/data/newsArticles";

// GET /api/setup — Check current DB status
export async function GET() {
  try {
    await dbConnect();
    const userCount = await User.countDocuments();
    const articleCount = await Article.countDocuments();
    return NextResponse.json({
      status: "connected",
      users: userCount,
      articles: articleCount,
      setupNeeded: userCount === 0,
    });
  } catch (error) {
    return NextResponse.json({ status: "error", error: error.message }, { status: 500 });
  }
}

// POST /api/setup
// • First run  → creates admin user + seeds articles
// • Re-run with same email → resets password (useful during dev)
// • Re-run with different email → blocked (admin already exists)
export async function POST(request) {
  try {
    await dbConnect();

    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "name, email and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Check if any admin user already exists
    const existingUser = await User.findOne({});

    if (existingUser) {
      // Allow password reset only if same email is provided
      if (existingUser.email !== email.toLowerCase().trim()) {
        return NextResponse.json(
          { error: "Setup already completed. Admin user already exists. Go to /admin/login to sign in." },
          { status: 403 }
        );
      }

      // Same email → reset password
      await User.findByIdAndUpdate(existingUser._id, { name, password: hashedPassword });

      return NextResponse.json({
        success: true,
        message: "Admin password updated successfully. Go to /admin/login to sign in.",
        user: { email: existingUser.email, name },
      });
    }

    // No users exist → create fresh admin
    const user = await User.create({ name, email, password: hashedPassword, role: "admin" });

    // Seed articles
    const articleCount = await Article.countDocuments();
    let seeded = 0;

    if (articleCount === 0) {
      const articlesToInsert = newsArticles.map((a) => ({
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        content: a.content,
        image: a.image,
        imageAlt: a.title,
        category: a.category,
        author: a.author,
        tags: a.tags || [],
        readTime: a.readTime || "5 min",
        featured: a.featured || false,
        status: "published",
        views: a.views || 0,
        publishedAt: new Date(a.publishedAt),
        metaTitle: a.title,
        metaDescription: a.excerpt,
      }));

      const result = await Article.insertMany(articlesToInsert, { ordered: false });
      seeded = result.length;
    }

    return NextResponse.json({
      success: true,
      message: `Admin user created. ${seeded} articles seeded. Go to /admin/login to sign in.`,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error("[Setup]", error);
    return NextResponse.json({
      error: error.message || "Setup failed",
      code: error.code,
      name: error.name,
    }, { status: 500 });
  }
}
