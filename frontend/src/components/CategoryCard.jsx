function CategoryCard({ title }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg transition cursor-pointer">
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
  );
}

export default CategoryCard;