export default function handler(req, res) {
  res.status(200).json([
    {
      id: 1,
      name: "Banner Print",
      customer: "Rahim",
      total: 5000,
      due: 1000,
      status: "Pending"
    }
  ]);
}
