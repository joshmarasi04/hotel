import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";
import bcrypt from "bcrypt";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Test API
app.get("/", (req, res) => {
  res.json({
    message: "Hotel Reservation System API is running!"
  });
});

// Get all rooms
app.get("/api/rooms", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        rooms.id,
        rooms.room_number,
        rooms.status,
        room_types.name AS room_type,
        room_types.description,
        room_types.price_per_night,
        room_types.capacity
      FROM rooms
      JOIN room_types
        ON rooms.room_type_id = room_types.id
      ORDER BY rooms.room_number
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Rooms error:", error.message);

    res.status(500).json({
      message: "Failed to retrieve rooms."
    });
  }
});

// Create reservation
app.post("/api/reservations", async (req, res) => {
  try {
    const {
      user_id,
      room_id,
      check_in,
      check_out,
      guests_count
    } = req.body;

    if (
      !user_id ||
      !room_id ||
      !check_in ||
      !check_out ||
      !guests_count
    ) {
      return res.status(400).json({
        message: "All reservation fields are required."
      });
    }

    const roomResult = await pool.query(
      `
      SELECT
        rooms.id,
        rooms.status,
        room_types.price_per_night,
        room_types.capacity
      FROM rooms
      JOIN room_types
        ON rooms.room_type_id = room_types.id
      WHERE rooms.id = $1
      `,
      [room_id]
    );

    if (roomResult.rows.length === 0) {
      return res.status(404).json({
        message: "Room not found."
      });
    }

    const room = roomResult.rows[0];

    if (room.status !== "available") {
      return res.status(400).json({
        message: "Room is not available."
      });
    }

    if (guests_count > room.capacity) {
      return res.status(400).json({
        message: "Number of guests exceeds room capacity."
      });
    }

    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);

    const nights = Math.ceil(
      (checkOutDate - checkInDate) /
        (1000 * 60 * 60 * 24)
    );

    if (nights <= 0) {
      return res.status(400).json({
        message: "Check-out date must be after check-in date."
      });
    }

    const totalAmount =
      nights * Number(room.price_per_night);

    const result = await pool.query(
      `
      INSERT INTO reservations
      (
        user_id,
        room_id,
        check_in,
        check_out,
        guests_count,
        total_amount
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        user_id,
        room_id,
        check_in,
        check_out,
        guests_count,
        totalAmount
      ]
    );

    res.status(201).json({
      message: "Reservation created successfully.",
      reservation: result.rows[0]
    });
  } catch (error) {
    console.error(
      "Reservation error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to create reservation."
    });
  }
});

// Get reservations for a specific guest
app.get(
  "/api/reservations/user/:userId",
  async (req, res) => {
    try {
      const { userId } = req.params;

      const result = await pool.query(
        `
        SELECT
          reservations.id,
          reservations.user_id,
          reservations.room_id,
          reservations.check_in,
          reservations.check_out,
          reservations.guests_count,
          reservations.total_amount,
          reservations.status,
          reservations.created_at,

          rooms.room_number,

          room_types.name AS room_type,
          room_types.description,
          room_types.price_per_night

        FROM reservations

        JOIN rooms
          ON reservations.room_id = rooms.id

        JOIN room_types
          ON rooms.room_type_id = room_types.id

        WHERE reservations.user_id = $1

        ORDER BY reservations.created_at DESC
        `,
        [userId]
      );

      res.json(result.rows);

    } catch (error) {
      console.error(
        "Get reservations error:",
        error.message
      );

      res.status(500).json({
        message: "Failed to retrieve reservations."
      });
    }
  }
);

// Guest registration
app.post("/api/auth/register", async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      phone
    } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        message:
          "Full name, email, and password are required."
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "Email is already registered."
      });
    }

    const passwordHash = await bcrypt.hash(
      password,
      10
    );

    const result = await pool.query(
      `
      INSERT INTO users
      (
        full_name,
        email,
        password_hash,
        phone,
        role
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        'guest'
      )
      RETURNING
        id,
        full_name,
        email,
        phone,
        role
      `,
      [
        full_name,
        email,
        passwordHash,
        phone || null
      ]
    );

    res.status(201).json({
      message: "Registration successful.",
      user: result.rows[0]
    });
  } catch (error) {
    console.error(
      "Registration error:",
      error.message
    );

    res.status(500).json({
      message: "Registration failed."
    });
  }
});

// Guest login
app.post("/api/auth/login", async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required."
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        full_name,
        email,
        password_hash,
        phone,
        role
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    res.json({
      message: "Login successful.",
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    console.error(
      "Login error:",
      error.message
    );

    res.status(500).json({
      message: "Login failed."
    });
  }
});

// Payments
app.post("/api/payments", async (req, res) => {
  try {
    const {
      reservation_id,
      amount,
      payment_method
    } = req.body;

    if (
      !reservation_id ||
      !amount ||
      !payment_method
    ) {
      return res.status(400).json({
        message: "Payment fields are required."
      });
    }

    const reservationResult = await pool.query(
      `
      SELECT
        id,
        total_amount,
        status
      FROM reservations
      WHERE id = $1
      `,
      [reservation_id]
    );

    if (reservationResult.rows.length === 0) {
      return res.status(404).json({
        message: "Reservation not found."
      });
    }

    const reservation = reservationResult.rows[0];

    if (
      Number(amount) !==
      Number(reservation.total_amount)
    ) {
      return res.status(400).json({
        message:
          "Payment amount does not match reservation total."
      });
    }

    const existingPayment = await pool.query(
      `
      SELECT id
      FROM payments
      WHERE reservation_id = $1
        AND status = 'paid'
      `,
      [reservation_id]
    );

    if (existingPayment.rows.length > 0) {
      return res.status(400).json({
        message:
          "Reservation has already been paid."
      });
    }

    const transactionReference =
      `PAY-${Date.now()}-${reservation_id}`;

    const paymentResult = await pool.query(
      `
      INSERT INTO payments
      (
        reservation_id,
        amount,
        payment_method,
        transaction_reference,
        status,
        paid_at
      )
      VALUES
      ($1, $2, $3, $4, 'paid', CURRENT_TIMESTAMP)
      RETURNING *
      `,
      [
        reservation_id,
        amount,
        payment_method,
        transactionReference
      ]
    );

    await pool.query(
      `
      UPDATE reservations
      SET status = 'confirmed'
      WHERE id = $1
      `,
      [reservation_id]
    );

    res.status(201).json({
      message: "Payment recorded successfully.",
      payment: paymentResult.rows[0]
    });

  } catch (error) {
    console.error(
      "Payment error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to process payment."
    });
  }
});

// Admin dashboard statistics
app.get(
  "/api/admin/dashboard-stats",
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          (SELECT COUNT(*) FROM rooms) AS total_rooms,

          (SELECT COUNT(*)
           FROM rooms
           WHERE status = 'available') AS available_rooms,

          (SELECT COUNT(*)
           FROM reservations) AS total_reservations,

          (SELECT COUNT(*)
           FROM reservations
           WHERE status = 'pending') AS pending_reservations,

          (SELECT COUNT(*)
           FROM reservations
           WHERE status = 'confirmed') AS confirmed_reservations,

          (SELECT COUNT(*)
           FROM reservations
           WHERE status = 'cancelled') AS cancelled_reservations,

          (SELECT COUNT(*)
           FROM payments
           WHERE status = 'paid') AS paid_payments,

          (SELECT COALESCE(SUM(amount), 0)
           FROM payments
           WHERE status = 'paid') AS total_revenue
      `);

      res.json(result.rows[0]);

    } catch (error) {
      console.error(
        "Dashboard statistics error:",
        error.message
      );

      res.status(500).json({
        message:
          "Failed to retrieve dashboard statistics."
      });
    }
  }
);

// Recent reservations for admin dashboard
app.get(
  "/api/admin/recent-reservations",
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          reservations.id,
          users.full_name AS guest_name,
          rooms.room_number,
          room_types.name AS room_type,
          reservations.check_in,
          reservations.check_out,
          reservations.total_amount,
          reservations.status,
          reservations.created_at
        FROM reservations

        JOIN users
          ON reservations.user_id = users.id

        JOIN rooms
          ON reservations.room_id = rooms.id

        JOIN room_types
          ON rooms.room_type_id = room_types.id

        ORDER BY reservations.created_at DESC

        LIMIT 5
      `);

      res.json(result.rows);

    } catch (error) {
      console.error(
        "Recent reservations error:",
        error.message
      );

      res.status(500).json({
        message:
          "Failed to retrieve recent reservations."
      });
    }
  }
);

// Admin guests
app.get(
  "/api/admin/guests",
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          id,
          full_name,
          email,
          phone,
          role,
          created_at
        FROM users
        WHERE role = 'guest'
        ORDER BY created_at DESC
      `);

      res.json(result.rows);

    } catch (error) {
      console.error(
        "Admin guests error:",
        error.message
      );

      res.status(500).json({
        message:
          "Failed to retrieve guests."
      });
    }
  }
);
// Admin payments
app.get(
  "/api/admin/payments",
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          payments.id,
          users.full_name AS guest_name,
          rooms.room_number,
          payments.reservation_id,
          payments.amount,
          payments.payment_method,
          payments.transaction_reference,
          payments.status,
          payments.paid_at,
          payments.created_at
        FROM payments

        JOIN reservations
          ON payments.reservation_id = reservations.id

        JOIN users
          ON reservations.user_id = users.id

        JOIN rooms
          ON reservations.room_id = rooms.id

        ORDER BY payments.created_at DESC
      `);

      res.json(result.rows);

    } catch (error) {
      console.error(
        "Admin payments error:",
        error.message
      );

      res.status(500).json({
        message:
          "Failed to retrieve payments."
      });
    }
  }
);

// Start server
app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});