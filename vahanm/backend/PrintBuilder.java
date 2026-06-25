import java.lang.reflect.Method;

public class PrintBuilder {
    public static void main(String[] args) throws Exception {
        Class<?> clazz = Class.forName("dev.langchain4j.store.embedding.mongodb.MongoDbEmbeddingStore$Builder");
        for (Method m : clazz.getMethods()) {
            if (m.getParameterTypes().length > 0) {
                System.out.println(m.getName() + " -> " + m.getParameterTypes()[0].getName());
            }
        }
    }
}
