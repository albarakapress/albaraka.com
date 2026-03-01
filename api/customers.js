export default function handler(req, res) {
  res.status(200).json([
    {
      id: 1,
      name: "Rahim",
      phone: "01700000000",
      address: "Dhaka"
    }
  ]);
}
